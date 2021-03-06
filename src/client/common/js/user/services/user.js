// user.js - for now mostly duplicated from the website
angular.module('User') // separate module for sharing with website
.constant('DEFAULT_AVATAR', '/images/noavatar.png')
.factory('User', ['DEFAULT_AVATAR', '$http', '$log', '$q', '$rootScope', function(DEFAULT_AVATAR, $http, $log, $q, $rootScope) {
    var User = function(json) {
        angular.copy(json || {}, this);
    };

    User.prototype.roles = [];

    // todo: make this a getter?
    User.prototype.$avatar = function() { return this.forum_avatar || DEFAULT_AVATAR; };

    User.prototype.$hasRole = function(role) {
        return this.roles.indexOf(role) >= 0;
    };

     User.getProfile = function(username) {
        return $http.get('/api/profile/' + username)
            .then(function(response) {
                return response.data[0];
            }, function(err) {
                $log.error('error retreiving user', err);

                return $q.reject('error retreiving user', err);
            });
    };

    User.getAll = function(){
        return $http.get('/api/users')
            .then(function(response) {
                var users = [];
                angular.forEach(response.data, function(user){
                    users.push(new User(user));
                });
                return users;
            }, function(error) {
                return $q.reject('error retrieving all users', err);
            });
    };

    // login user, sets currentUser
    User.login = function(username, password) {
        return $http.post('/login', {username: username, password: password})
            .then(function(response) {
                // should be new reference? hmmm
                $rootScope.currentUser = new User(response.data);
                //angular.copy(response.data, $rootScope.currentUser);

                return true;
            }, function(err) {
                //$log.log('User service login error', err);
                return $q.reject(err);
            });
    };

    User.getByName = function(username) {
        $log.log("getting user");
        return $http.get('/api/user/' + username)
            .then(function(response) {
                return response;
            }, function(err) {
                $log.error('error retreiving user', err);

                return $q.reject('error retreiving user', err);
            });
    };


    // get currently signed in user if exists or guest account
    User.getCurrentUser = function() {

        return $http.get('/api/session/user')
            .then(function(response) {
                $log.log('get user success', response);

                var user = new User(response.data);
                user.authenticated = true; // todo: move to server?
                return user;
            }, function(err) {
                if(err.status === 404) {
                    // this just means not logged in
                    var user = new User({
                        id: 0,
                        username: 'guest',
                        authenticated: false
                    });

                    return user;
                } else {
                    //$log.error('error retreiving user session', err);
                    $q.reject(err);
                }
            });

    };

    // criteria for valid username
    User.validateUsername = function(username) {
        var test = /^[A-Za-z0-9 _.@]*$/;

        return test.test(username) && username.length > 3 && username.length <= 20;
    };

    // criteria for valid email address
    User.validateEmail = function(email) {
        var test = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

        return test.test(email) && email.length <= 254;
    };

    // password test only works on pre-hashed
    User.validatePassword = function(password) {
        // since it gets hashed it can really be anything
        return password.length > 3 && password.length <= 254;
    };

    User.register = function(username, password, email) {
        return $http.post('/api/user', {
            Ux466hj8: username,
            Ed2h18Ks: password,
            s8HO5oYe: email,
            url: 'shibby'
        }).then(function(response) {
            return new User(response.data);
        }, function(response) {
            return $q.reject(response.data);
        });
    };

    return User;
}]);
