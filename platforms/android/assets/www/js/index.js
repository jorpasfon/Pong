var app = {
    inicio: function(){
        
        velocidadX = 0;
        dificultad = 0;
        victoria = false;
        
        alto = document.documentElement.clientHeight;
        ancho = document.documentElement.clientWidth;

        app.vigilaSensores();
        app.iniciaJuego();

               
    },

    iniciaJuego:function() {

        var paddleJugador;
        var paddleIA;
        var bolaLanzada;
        var velocidadBola;
        var bola;
        var puntJugador = 0;
        var puntIA = 0;
        var puntJugadorText;
        var puntIAText;
        var medio;


        function preload() {
            game.load.image('paddle', 'assets/paddle.png');
            game.load.image('bola', 'assets/ball.png');
            game.load.image('medio', 'assets/medio.png');
        }

        function create() {
            bolaLanzada = false;
            velocidadBola = 300;

            game.scale.forcePortrait = true;
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

            medio = game.add.sprite(game.world.centerX, 0, 'medio');
            paddleJugador = crearPaddle(10, game.world.centerY);
            paddleIA = crearPaddle(game.world.width - 20, game.world.centerY);
            bola = crearBola(game.world.centerX, game.world.centerY);
            game.physics.arcade.checkCollision.left = false;
            game.physics.arcade.checkCollision.right = false;
            paddleJugador.body.immovable = true;
            paddleIA.body.immovable = true;

            puntJugadorText = game.add.text(game.world.width/3, 5, '0', { font: '50px Arial', fill: '#FFFFFF' });
            puntIAText = game.add.text(game.world.width*0.65, 5, '0', { font: '50px Arial', fill: '#FFFFFF' });

            game.input.onTap.add(lanzarBola, this);
        }

        function update() {
           paddleJugador.body.velocity.y = velocidadX*350;
           paddleIA.body.velocity.y = getVelocidadIA()*5+(5*dificultad);
           game.physics.arcade.collide(bola, paddleJugador);
           game.physics.arcade.collide(bola, paddleIA);

           if (victoria()) {
            siguienteNivel();
           } else if (victoriaIA()) {
            reiniciarNivel();
           }
        }

        function siguienteNivel() {
            navigator.notification.confirm('Has ganado!', null, 'Victoria', 'Siguiente');
            reiniciarBola();
            dificultad++;
            puntJugador = 0;
            puntIA = 0;
            puntJugadorText.setText(puntJugador);
            puntIAText.setText(puntIA);
            velocidadBola += dificultad*25;
        }

        function reiniciarNivel() {
            navigator.notification.confirm('Has perdido!', null, 'Derrota', 'Reintentar');
            reiniciarBola();
            puntJugador = 0;
            puntIA = 0;
            puntJugadorText.setText(puntJugador);
            puntIAText.setText(puntIA);
        }

        function victoria() {
            return (puntJugador == 5+2*dificultad);
        }

        function victoriaIA() {
            return (puntIA == 5+2*dificultad);
        }

        function getVelocidadIA() {
            return(bola.y - paddleIA.y); 
        }

        function crearPaddle(x,y) {
            var paddle = game.add.sprite(x, y, 'paddle');

            posicionY = y;

            paddle.anchor.setTo(0.5, 0.5);
            game.physics.arcade.enable(paddle);
            paddle.body.collideWorldBounds = true;

            return paddle;
        }

        function crearBola(x,y) {
            var bola = game.add.sprite(x, y, 'bola');

            bola.anchor.setTo(0.5, 0.5);
            game.physics.arcade.enable(bola);
            bola.body.collideWorldBounds = true;
            bola.checkWorldBounds = true;
            bola.body.bounce.setTo(1,1);
            bola.events.onOutOfBounds.add(punto, this);
            
            return bola;
        }

        function punto() {
            if (bola.x < 20) {
                puntIA = puntIA + 1;
                puntIAText.setText(puntIA);
            } else if (bola.x > 20) {
                puntJugador = puntJugador + 1;
                puntJugadorText.setText(puntJugador);
            }

            setTimeout(reiniciarBola, 1000);
        }

        function lanzarBola() {
            if(bolaLanzada) {
                bola.x = game.world.centerX;
                bola.y = game.world.centerY;
                bola.body.velocity.setTo(0,0);
                bolaLanzada = false;
            } else {
                bola.body.velocity.x = -velocidadBola;
                bola.body.velocity.y = velocidadBola;
                bolaLanzada = true;
            }
            game.input.onTap.remove(lanzarBola, this);
        }

        function reiniciarBola() {
            bola.x = game.world.centerX;
            bola.y = game.world.centerY;
            bola.body.velocity.setTo(0,0);
            bolaLanzada = false;
            game.input.onTap.add(lanzarBola, this);
        }

        var estados = { preload: preload, create: create, update: update };
        var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser',estados);

    },

    vigilaSensores:function() {
        function onError() {
            console.log('onError!');
        }
        function onSuccess(datosAceleracion) {
            app.detectaAgitacion(datosAceleracion);
            app.registraDireccion(datosAceleracion);
        }

         navigator.accelerometer.watchAcceleration(onSuccess, onError, {frequency: 10});
    },

    detectaAgitacion:function(datosAceleracion) {
        agitacionX = datosAceleracion.x > 10;
        agitacionY = datosAceleracion.y > 10;

        if (agitacionY || agitacionX) {
            setTimeout(app.recomienza, 1000);
        }
    },

    recomienza:function() {
        document.location.reload(true);
    },    
    
    registraDireccion:function(datosAceleracion) {
        velocidadX = datosAceleracion.x;
    }
   
};

if('addEventListener' in document){
    document.addEventListener('deviceready', function(){
        app.inicio();
    }, false);
}