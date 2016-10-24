
//backbone-dotattr
(function(_, Backbone) {
    _.extend(Backbone.Model.prototype, {
        get: function(key) {
            return _.reduce(key.split('.'), function(attr, key) {
                if (attr instanceof Backbone.Model)
                    return attr.attributes[key];

                return attr[key];
            }, this.attributes);
        }
    });
})(window._, window.Backbone);



//serializeObject
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

//User View
var DetailView = Backbone.View.extend({
    el: "#detail_view",
    template: _.template( $("#detail").html()),
    initialize: function(){
        this.show();
        this.render();

        this.model.on("invalid", function(model, error) {
            $('input[name='+model.validationError.name+']').parent().append('<span class="error">'+model.validationError.message+'</span>').addClass('has-error');
            $('#save').prop( "disabled", true );
        });

    },
    events: {
        'click #cancel' : 'cancel',
        'click #save' : 'save',
        'keyup input': 'validationScope',
    },

    show : function () {
        $(".grid").hide();
        $("#detail_view").show();
    },

    hide: function () {
        $(".grid").show();
        $("#detail_view").hide();
    },

    cancel: function (e) {
        e.preventDefault();
        this.hide();
    },

    save: function (e) {
        e.preventDefault();
        this.model.set($('#user').serializeObject(), {validate: true});
        this.model.save();
        this.hide();
        $('.error').remove();
    },

    validationScope: function(e) {
        $(e.currentTarget).parent().removeClass('has-error');
        $(e.currentTarget).parent().find('.error').remove();
        $('#save').prop( "disabled", false );


        var attrs = {};
        attrs[e.currentTarget.name] =  e.currentTarget.value;
        this.model.set(attrs, {validate: true});
    },

    render: function(){
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

//Clickable Row
var ClickableRow = Backgrid.Row.extend({
    events: {
        "click": "onClick",
    },

    onClick: function () {
        var Detail = new DetailView({ model: this.model });
        Backbone.trigger("rowclicked", this.model);
    }
});


//Our model vit validation
var UserModel = Backbone.Model.extend({
    validate: function(attrs, options) {
        if (attrs.name.length <= 3) {
            return {name : "name", message: 'Name length is < 3.'};
        }
        if (attrs.email.length < 6 || !/[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/ig.test(attrs.email)) {
            return {name : "email", message: 'Email is invalid.'};
        }
        if (attrs.website.length < 6 || !/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(attrs.website)) {
            return  {name : "website", message: 'URL is invalid. Please add protocol.'};
        }
    },
});


//Pageable Collection
var UserCollection = Backbone.PageableCollection.extend({
    model: UserModel,
    url: "http://jsonplaceholder.typicode.com/users",
    mode: "client",
    state: {
        pageSize: 5
    },

});

var user = new UserCollection();

//Backgrid
var grid = new Backgrid.Grid({
    columns: [{
        name: "name",
        label: "Name",
        editable: false,
        cell: "string"
    }, {
        name: "email",
        label: "Email",
        editable: false,
        cell: "email"
    }, {
        name: 'address.city',
        label: "City",
        cell: "string"
    }],
    collection: user,
    row: ClickableRow,
});

var paginator = new Backgrid.Extension.Paginator({
    collection: user
});

$("#grid").append(grid.render().$el);
$("#paginator").append(paginator.render().$el);


user.fetch();