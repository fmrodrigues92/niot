const {ipcRenderer} = require('electron')
var serverApi, server, user, pass, accessToken, serverStatus, serverApiStatus, login, loggedApiUser;

serverApi = 'http://niot-env.eba-nj9qdzma.sa-east-1.elasticbeanstalk.com/';
//serverApi = 'http://api.niot.test/';
// server = 'https://localhost:30443/';
// user = 'niot';
// pass = 'niot';

serverStatus = false;
serverApiStatus = false;
formApiLogin = false;
login = false;
loginApi = false;

condominio = false;
formUnidades = false;

ipcRenderer.send('first-message', {} )
ipcRenderer.on('first-reply', (event, arg) => {
    
    if(arg !== undefined){
        //serverApi = arg.cloudAddress;
        server = arg.serverAddress;
        user = arg.serverUser;
        pass = arg.serverPass;
    }else{
        server = 'https://localhost:30443/';
        user = 'niot';
        pass = 'niot';
    }

   //$('#exampleFormControlInput0').val(serverApi);
    $('#exampleFormControlInput1').val(server);
    $('#exampleFormControlInput2').val(user);
    $('#exampleFormControlInput3').val(pass);
})




window.onload = function() {

    setTimeout(
    function() 
    {

        start();
        
    }, 1000);

    // receive message from main.js
    


    $( ".toSubmit" ).submit(function( event ) {

        event.preventDefault();
    
        let serverAddress = document.getElementById("exampleFormControlInput1").value;
        let serverUser = document.getElementById("exampleFormControlInput2").value;
        let serverPass = document.getElementById("exampleFormControlInput3").value;
    
        let data = {serverAddress, serverUser, serverPass};
    
        // send username to main.js
        
        ipcRenderer.send('asynchronous-message', data )
    
        // receive message from main.js
        ipcRenderer.on('asynchronous-reply', (event, arg) => {
            console.log(arg)
        });


        serverStatus = false;
        serverApiStatus = false;
        login = false;

        alert('Atualizado');

    });

    $( ".toApiLogin" ).submit(function( event ) {

        event.preventDefault();
    
        let username = document.getElementById("username").value;
        let pass = document.getElementById("password").value;
    
        
        toLoginApi(username, pass);
        

    });

    $( ".toCondSelect" ).submit(function( event ) {

        event.preventDefault();
    
        condominio = document.getElementById("unidadeSelect").value;

        formUnidades = false;
        if(formUnidades == false){
            $('.form-api-unidades').addClass('d-none');
        }
    
    });
};

function ping(){

    $('#SS').html('<div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div>');
    $('#CS').html('<div class="spinner-border spinner-border-sm" role="status"><span class="sr-only">Loading...</span></div>');

    $.ajax({
        type: "GET",
        url: server,
    }).done(function(res) {
        serverStatus = true;
        $('#SS').html('OK');
    })
    .fail(function() {
        serverStatus = false;
        $('#SS').html('Fail');
    })
    .always(function() {
        //
    });

    $.ajax({
        type: "GET",
        url: serverApi,
    }).done(function(res) {
        serverApiStatus = true;
        $('#CS').html('OK');

        formApiLogin = true;

        if(formApiLogin == true){
            $('.form-api-login').removeClass('d-none');
        }
    })
    .fail(function() {
        serverApiStatus = false;
        $('#CS').html('Fail');
    })
    .always(function() {
        //
    });

}

function toLogin(){

    var data = '{"username":"'+user+'","password":"'+pass+'","passwordCustom":null}';

    $.ajax({
        type: "POST",
        url: server + 'api/login',
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
    }).done(function(res) {
        accessToken = res.accessToken;


        login = true;


    })
    .fail(function() {
        //alert( "error" );
    })
    .always(function() {
        //
    });
}

function toLoginApi(user, pass){

    var data = '{"email":"'+user+'","pass":"'+pass+'"}';

    $.ajax({
        type: "POST",
        url: serverApi + 'api/usuario/login',
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
    }).done(function(res) {

        loggedApiUser = res.usuario;
        loginApi = true;

        formApiLogin = false;
        if(formApiLogin == false){
            $('.form-api-login').addClass('d-none');
        }

        formUnidades = true;
        if(formUnidades == true){
            $('.form-api-unidades').removeClass('d-none');
        }
        
        loggedApiUser.CondominioUnidades.forEach(element => {
            //console.log(element.Condominio, element.Nome);
            $('#unidadeSelect').append('<option value="'+element.Condominio.$oid+'">'+element.Nome+'</option>');
        });
    })
    .fail(function(err) {
        console.log(err);
        //alert( "erro durante login na API" );
    })
    .always(function() {
        //
    });
}

function start(){

    setInterval(function(){

        

        if(serverApiStatus == true && serverStatus == true){
            if(login == true && loginApi == true){
                if(condominio != false){
                    getAcessos();
                    delAcessos();
                }
            }else{
                
                toLogin();
            }
        }else{
            ping();
        }

    }, 5000);

}

function delAcessos(){

    let data = {'condId':condominio};

    $.ajax({
        type: "GET",
        url: serverApi + 'api/acessos/get-del-access',
        contentType:"application/json; charset=utf-8",
        data: data,
        dataType:"json",
    }).done(function(res) {
        res.forEach(element => {
            
            //===============================================================
            //Delete User -> DELETE => https://localhost:30443/api/user/1000033
            $.ajax({
                type: "DELETE",
                url: server + 'api/user/' + element.Id,
                contentType:"application/json; charset=utf-8;",
                headers: {
                    "Authorization": "Bearer " + accessToken
                },
                dataType:"json",
            }).done(function(res) {
                //
            })
            .fail(function() {
                //alert( "error" );
            })
            .always(function() {
                //
            });
            //===============================================================

            //===============================================================
            //Delete Rule -> DELETE => https://localhost:30443/api/rule/2
            $.ajax({
                type: "DELETE",
                url: server + 'api/rule/' + element.ruleId,
                contentType:"application/json; charset=utf-8;",
                headers: {
                    "Authorization": "Bearer " + accessToken
                },
                dataType:"json",
            }).done(function(res) {
                //
            })
            .fail(function() {
                //alert( "error" );
            })
            .always(function() {
                //
            });
            //===============================================================

            //===============================================================
            //Delete Time -> DELETE => https://localhost:30443/api/schedule/2
            $.ajax({
                type: "DELETE",
                url: server + 'api/schedule/' + element.timeId,
                contentType:"application/json; charset=utf-8;",
                headers: {
                    "Authorization": "Bearer " + accessToken
                },
                dataType:"json",
            }).done(function(res) {
                //
            })
            .fail(function() {
                //alert( "error" );
            })
            .always(function() {
                //
            });
            //===============================================================

            //===============================================================
            //===============================================================
            //===============================================================

            $.ajax({
                type: "POST",
                url: serverApi + 'api/acessos/complete-delete/' + element._id,
                contentType:"application/json; charset=utf-8",
                dataType:"json",
            }).done(function(res) {
                console.log('done');
            })
            .fail(function() {
                //alert( "error" );
            })
            .always(function() {
                //
            });
            //===============================================================
            //===============================================================
            //===============================================================
            
        });
    })
    .fail(function() {
        //alert( "error" );
    })
    .always(function() {
        //
    });
}

function getAcessos(){

    let data = {'condId':condominio};

    $.ajax({
        type: "GET",
        url: serverApi + 'api/acessos',
        contentType:"application/json; charset=utf-8",
        data: data,
        dataType:"json",
    }).done(function(res) {
        res.forEach(element => {
            
            //Cadastra horario
            var schedule = {
                'name' : 'Niot-' + element._id,
            };

            var timeStart, timeEnd;
            //PERIODOS
            if(element.PeriodoAcesso == 'DiaTodo'){
                timeStart = "0";
                timeEnd = "86340";
            }
            if(element.PeriodoAcesso == 'manha'){
                timeStart = "25200";
                timeEnd = "43140";
            }
            if(element.PeriodoAcesso == 'tarde'){
                timeStart = "43200";
                timeEnd = "64740";
            }
            if(element.PeriodoAcesso == 'noite'){
                timeStart = "64800";
                timeEnd = "86340";
            }
            if(element.PeriodoAcesso == 'madrugada'){
                timeStart = "0";
                timeEnd = "25140";
            }   
            if(element.PeriodoAcesso == 'comercial'){
                timeStart = "32400";
                timeEnd = "64800";
            }

            //WEEKDAYS

            if(element.Weekdays.includes('seg')){
                schedule['mondayStart'] = timeStart;
                schedule['mondayEnd'] = timeEnd;
            }
            if(element.Weekdays.includes('ter')){
                schedule['tuesdayStart'] = timeStart;
                schedule['tuesdayEnd'] = timeEnd;
            }
            if(element.Weekdays.includes('qua')){
                schedule['wednesdayStart'] = timeStart;
                schedule['wednesdayEnd'] = timeEnd;
            }
            if(element.Weekdays.includes('qui')){
                schedule['thursdayStart'] = timeStart;
                schedule['thursdayEnd'] = timeEnd;
            }
            if(element.Weekdays.includes('sex')){
                schedule['fridayStart'] = timeStart;
                schedule['fridayEnd'] = timeEnd;
            }
            if(element.Weekdays.includes('sab')){
                schedule['saturdayStart'] = timeStart;
                schedule['saturdayEnd'] = timeEnd;
            }
            if(element.Weekdays.includes('dom')){
                schedule['sundayStart'] = timeStart;
                schedule['sundayEnd'] = timeEnd;
            }

            var scheduleRegistred = createSchedule(schedule, element);

            

            

            //Send DeviceId to association
            
        });
    })
    .fail(function() {
        //alert( "error" );
    })
    .always(function() {
        //
    });
}

function updateCode(originElement, userRegistred, scheduleRegistred, assoc){

    var data = {'element' : originElement, 'user' : userRegistred, 'schedule' : scheduleRegistred, 'assoc' : assoc};

    data = JSON.stringify(data);

    $.ajax({
        type: "POST",
        url: serverApi + 'api/acessos/complete',
        data: data,
        contentType:"application/json; charset=utf-8",
        dataType:"json",
    }).done(function(res) {
        console.log('done');
    })
    .fail(function() {
        //alert( "error" );
    })
    .always(function() {
        //
    });
}

function assoc(scheduleRegistred, userRegistred, originElement){

    var data = {
        "name" : "Niot-" + originElement._id,
        "ReEntryLockEnabled":0,
        "EscortEnabled":0,
        "IsBiometryDisabled":false,
        "IsCardDisabled":false,
        "IsPasswordDisabled":false,
        "ManualAuthorizationOption":0,
        "RandomInspectPercent":0.1,
        "EscortPeriod":8,
        "users":[
            userRegistred.newID
        ],
        "areas":[
            1
        ],
        "schedules":[
            scheduleRegistred.newID
        ],
        "devices":[
            
        ],
        "creditTypes":[
            
        ],
        "selectedEscorted":[
            
        ],
        "selectedEscortUsers":[
            
        ],
        "idType":1
    };

    data = JSON.stringify(data);

    $.ajax({
        type: "POST",
        url: server + 'api/rule',
        data: data,
        contentType:"application/json; charset=utf-8;",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        dataType:"json",
    }).done(function(res) {
        //return res;

        var assoc = res;

        updateCode(originElement, userRegistred, scheduleRegistred, assoc);

        //alert('done');
    })
    .fail(function() {
        //alert( "error" );
    })
    .always(function() {
        //
    });
}

function createSchedule(schedule, originElement){
    var data = JSON.stringify(schedule);
    $.ajax({
        type: "POST",
        url: server + 'api/schedule',
        data: data,
        contentType:"application/json; charset=utf-8;",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        dataType:"json",
    }).done(function(res) {

        var schedule = res

        //Cadastra usuário
        createUser('Niot-' + originElement._id, originElement.CodAcesso, schedule, originElement);

        //return res;
    })
    .fail(function() {
        //alert( "error" );
    })
    .always(function() {
        //
    });
}

function createUser(newUser, newPass, schedule, originElement){

    var data = '{"credits":[],"inativo":false,"blackList":false,"contingency":false,"cards":[],"groups":[1],"groupsList":[{"contingency":false,"disableADE":false,"id":1,"id2":null,"idType":0,"maxTimeInside":null,"nPeople":0,"nUsers":0,"nVisitors":0,"name":"Departamento Padrão","qtyTotalSpots":0,"users":null,"usersList":null}],"shelfStartLifeDate":"","shelfLifeDate":"","customFields":{},"name":"'+newUser+'","password":"'+newPass+'","password_confirmation":"'+newPass+'","pis":0,"shelfLife":null,"shelfStartLife":null,"foto":null,"fotoDoc":null}';

    $.ajax({
        type: "POST",
        url: server + 'api/user',
        data: data,
        contentType:"application/json; charset=utf-8;",
        headers: {
            "Authorization": "Bearer " + accessToken
        },
        dataType:"json",
    }).done(function(res) {

        var userRegistred = res;

        var assocRegistred = assoc(schedule, userRegistred, originElement);

        //return res;
    })
    .fail(function() {
        //alert( "error" );
    })
    .always(function() {
        //
    });

}




