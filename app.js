var express = require('express');
var app = express();
var mongoose = require('mongoose');
var hbs = require('express-handlebars');
var session = require('express-session');
var cors = require('cors');

// Para poder usar sin problemas el async await
mongoose.Promise = global.Promise;

// Es para porder usar handlebars
app.engine('handlebars', hbs());
app.set('view engine','handlebars');
app.use(cors());


// para poder recibir la información cuando uso un formulario
// Los app.use son middelware o algo así. Los middleware agregan información.
app.use(express.urlencoded({extended:true}));

app.use(express.json());

app.use(session({secret:'abcd'})); // Usa un middleware (pasa por esta funcion y despues por mi código) Con app.use tengo un req.session

async function conectar(){
    await mongoose.connect(
                // 'mongodb://10.5.20.78:27017/curso',          
                // 'mongodb://localhost/
                // 10.128.35.136 (ip de donde esta el server de mongo db)

        // PC de Orlando
        //        'mongodb://10.128.35.136:27017/curso',

                // 'mongodb://127.0.0.1/curso',                        

                'mongodb://localhost/curso',                        

                {useNewUrlParser:true}
    );
    console.log("conectado!");
}

// promise con h
// mongoose.connect(
//     'mongodb://10.5.20.78:27017',          {useNewUrlParser:true}
// ).then(function(){
//     console.log("conectado");
// })


conectar();

const ArtistaSchema = mongoose.Schema(
    {nombre: String,
    apellido: String}
)

const ArtistaModel = mongoose.model('Artista',ArtistaSchema);

const UsuarioSchema = mongoose.Schema(
    {username: String,
    password: String,
    email: String}
);

const UsuarioModel = mongoose.model('Usuario',UsuarioSchema);


    // const UsuarioSchema = mongoose.Schema({
    //     username: String,
    //     password: String,
    //     email: String
    // })
    // const UsuarioModel = mongoose.model('usuario', UsuarioSchema);
    // UsuarioModel.create({
    //     username: 'admin',
    //     password: 'admin123',
    //     email: 'admin@gmail.com'
    // });



// mongoose.connect('localhost');
// 27017 es un puerto por donde escucha mongo

app.get('/', async function(req,res){
    var listado = await ArtistaModel.find();

    // res.send('Hola Mundo');
    res.send(listado);
});


// Aplicando filtros
app.get('/buscar/:id', async function(req,res){
// req.params.id

    var listado = await ArtistaModel.find({_id:req.params.id});

    // res.send('Hola Mundo');
    res.send(listado);
});


app.get('/agregar', async function(req,res){
    var nuevoArtista = await ArtistaModel.create({nombre:'Samboni', apellido:'Rogelio'}
    );
    res.send(nuevoArtista);
});




app.get('/modificar', async function(req,res){
    await ArtistaModel.findByIdAndUpdate({_id:"5e570aede6bb2b230807a4d9"}, {nombre:'Carlos', apellido:'Colombraro'}
    );
    res.send("Modificado Ok");
});

app.get('/borrar', async function(req,res){
    var rta = await ArtistaModel.findByIdAndRemove({_id:"5e570aede6bb2b230807a4d9"}
    );
    res.send("Borrado Ok " + rta);
});

app.get('/listado', async function(req,res){

    // if(!req.session.user_id){
    //     res.redirect('/login');
    //     return;
    // }

    var abc = await ArtistaModel.find().lean();
    res.render('listado',{listado:abc});
});


// Muestra el formulario de Alta
app.get('/alta', async function(req,res){
    // var abc = await ArtistaModel.find();
    res.render('alta');
});


// Aca se recibe la info del formulario
app.post('/alta', async function(req,res){

     if(req.body.nombre==''){
         res.render('alta',{
            error: "El nombre es obligatorio", 
            datos:{nombre:req.body.nombre,apellido:req.body.apellido}
        });
        return;
    }

    var nuevoArtista = await ArtistaModel.create({
        nombre:req.body.nombre, 
        apellido:req.body.apellido
    });

    res.redirect('/listado'); // siempre entra a un get

});


// Muestra el formulario de Alta
app.get('/borrar/:id', async function(req,res){
    // var abc = await ArtistaModel.find();
    var rta = await ArtistaModel.findByIdAndRemove({_id:req.params.id}
    );
    // res.send("Borrado Ok " + rta);

    res.redirect('/listado'); // siempre entra a un get

});


// Editar

app.get('/editar/:id', async function(req,res){

    var artista = await ArtistaModel.findById({_id:req.params.id}).lean();

    // res.send(artista);

    res.render('alta',{datos:artista});
});

app.post('/editar/:id', async function(req,res){

    if(req.body.nombre==''){
        res.render('alta',{
           error: "El nombre es obligatorio", 
           datos:{nombre:req.body.nombre,apellido:req.body.apellido}
       });
       return;

   }


    await ArtistaModel.findByIdAndUpdate({_id:req.params.id}, 
        {nombre:req.body.nombre, apellido: req.body.apellido}
    );
    res.redirect('/listado'); 

});

app.get('/contar', function(req,res){
    if(!req.session.contador){ // Pregunta si la variable no está definida.
        req.session.contador = 0;
    } 
    req.session.contador++;
    
    res.json(req.session.contador);
});

app.get('/login', function(req,res){
    res.render('login');
});


app.post('/login', async function(req,res){
    // user: admin / pass: admin123
    // if(req.body.usuario == 'admin' && req.body.password == 'admin123')
    // {
    //     res.send('Bienvenido al Sistema');
    // } else {
    //     res.redirect('/login'); 
    // }

    var user = await UsuarioModel.find({username:req.body.usuario, password:req.body.password});

//    res.send(user);

//    return;

    // Aca ni llega

    if(user.length!=0)
    {
        req.session.user_id = user[0]._id;
        res.send('Bienvenido al Sistema');
    } else {
        res.redirect('/login'); 
    }


    // const UsuarioSchema = mongoose.Schema({
    //     username: String,
    //     password: String,
    //     email: String
    // })
    // const UsuarioModel = mongoose.model('usuario', UsuarioSchema);
    // UsuarioModel.create({
    //     username: 'admin',
    //     password: 'admin123',
    //     email: 'admin@gmail.com'
    // });


});


// Comenzamos con Apis

app.get('/api/artistas', async function(req,res){

    var listado = await ArtistaModel.find().lean();
    res.json(listado); // En lugar de send, pero con json devuelven json en general, ambos devuelves con json, pero por las dudas mejor usar json
});

app.get('/api/artistas/:id', async function(req,res){
    try {
        var unArtista = await ArtistaModel.findById(req.params.id);
        res.json(unArtista); // En lugar de send, pero con json devuelven json en general, ambos devuelves con json, pero por las dudas mejor usar json
            
    } catch (error) {
//        res.send("Id no identificado!")
        res.status(404
            ).send("error");

    }


});


app.post('/api/artistas', async function(req, res){
// req.body tambien
    // Evitamos handlebars
    var artista = await ArtistaModel.create(
        {
            nombre:req.body.nombre,
            apellido:req.body.apellido
        });

    res.json(artista);    
});


app.put('/api/artistas/:id', async function(req, res){

    try {
        await ArtistaModel.findByIdAndUpdate({_id:req.params.id}, 
            {nombre:req.body.nombre, apellido: req.body.apellido}
        );
    
        res.status(200).send('Ok!');
            
    } catch (error) {
        res.status(404).send('Id incorrecto!');
        
    }

});


app.delete('/api/artistas/:id', async function(req, res){

    try {
        await ArtistaModel.findByIdAndRemove({_id:req.params.id}
            );
        
            // Se hizo todo bien pero no tengo nada que decirle al cliente. El 204 no acepta contenido.
            res.status(204).send();    
                
    } catch (error) {
        res.status(404).send('Id no encontrado!');
        
    }

    


});


app.get('/signin', function(req,res){

    res.render('signin_form');

});


app.post('/signin', async function(req, res){

    if(req.body.username==""){
        // res.render('signin_form',{error:'El usuario y password son obligatorios', datos:req.body});
        res.render('signin_form',{error:'El usuario y password son obligatorios'});
        return;
    }

    await UsuarioModel.create({
        username:req.body.username, 
        password:req.body.password,
        email:req.body.email
    });

    res.redirect('/login'); // siempre entra a un get

})


// Buscar en un vector

app.get('/buscar', function(req,res){

    var listado = [
        {
          "userId": 1,
          "id": 1,
          "title": "delectus aut autem",
          "completed": false
        },
        {
          "userId": 1,
          "id": 2,
          "title": "quis ut nam facilis et officia qui",
          "completed": false
        },
        {
          "userId": 1,
          "id": 3,
          "title": "fugiat veniam minus",
          "completed": false
        },
        {
          "userId": 1,
          "id": 4,
          "title": "et porro tempora",
          "completed": true
        },
        {
          "userId": 1,
          "id": 5,
          "title": "laboriosam mollitia et enim quasi adipisci quia provident illum",
          "completed": false
        },
        {
          "userId": 1,
          "id": 6,
          "title": "qui ullam ratione quibusdam voluptatem quia omnis",
          "completed": false
        },
        {
          "userId": 1,
          "id": 7,
          "title": "illo expedita consequatur quia in",
          "completed": false
        },
        {
          "userId": 1,
          "id": 8,
          "title": "quo adipisci enim quam ut ab",
          "completed": true
        },
        {
          "userId": 1,
          "id": 9,
          "title": "molestiae perspiciatis ipsa",
          "completed": false
        },
        {
          "userId": 1,
          "id": 10,
          "title": "illo est ratione doloremque quia maiores aut",
          "completed": true
        },
        {
          "userId": 1,
          "id": 11,
          "title": "vero rerum temporibus dolor",
          "completed": true
        },
        {
          "userId": 1,
          "id": 12,
          "title": "ipsa repellendus fugit nisi",
          "completed": true
        },
        {
          "userId": 1,
          "id": 13,
          "title": "et doloremque nulla",
          "completed": false
        },
        {
          "userId": 1,
          "id": 14,
          "title": "repellendus sunt dolores architecto voluptatum",
          "completed": true
        },
        {
          "userId": 1,
          "id": 15,
          "title": "ab voluptatum amet voluptas",
          "completed": true
        },
        {
          "userId": 1,
          "id": 16,
          "title": "accusamus eos facilis sint et aut voluptatem",
          "completed": true
        },
        {
          "userId": 1,
          "id": 17,
          "title": "quo laboriosam deleniti aut qui",
          "completed": true
        },
        {
          "userId": 1,
          "id": 18,
          "title": "dolorum est consequatur ea mollitia in culpa",
          "completed": false
        },
        {
          "userId": 1,
          "id": 19,
          "title": "molestiae ipsa aut voluptatibus pariatur dolor nihil",
          "completed": true
        },
        {
          "userId": 1,
          "id": 20,
          "title": "ullam nobis libero sapiente ad optio sint",
          "completed": true
        }
      ];

      // Buscar el elemento con id igual a 7
      for(i = 0 ; i < listado.length; i++){

        // if(listado[i].id==7){

        //     res.send(listado[i]);

        // }
        listado[i].usuario = "Juan";

      }
      res.send(listado);

});


// Para que quede escuchando la aplicación el puerto
app.listen(80, function(){
    console.log('App en localhost');
});



