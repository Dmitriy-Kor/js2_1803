console.log("Hello, I'm server");

let fs = require('fs')
let express = require('express');

let server = express();
server.use(express.json());

server.get('/', (request, response) => {
  response.send('Hello "Teapot" :)');
})

// return all catalog
server.get('/catalog.json', (request, response) => {
  fs.readFile("./server/db/catalogData.json", 'utf-8',
    (err, data) => {
      if (!err) {
        //response.json(data);
        response.send(data)
      }
    })
})

// return all basket
server.get('/basket.json', (request, response) => {
  fs.readFile("./server/db/getBasket.json", 'utf-8',
    (err, data) => {
      if (!err) {
        // response.json(data);
        response.send(data)
      }
    })
})

// remove item from basket fully
server.put('/delbasket.json/:id', (request, response) => {
  let delObj = request.body;
  fs.readFile("./server/db/getBasket.json", 'utf-8',
    (err, data) => {
      if (!err) {
        let basket = JSON.parse(data);
        basket.contents = basket.contents.filter(b => b.id_product !== delObj.id_product);
        fs.writeFile("./server/db/getBasket.json", JSON.stringify(basket, null, " "), err => {
          response.json({'result': err ? 0 : 1})
        })
      } else {
        response.json({'result': 0})
      }
    })
})

// create new item in catalog
server.post('/addtocatalog.json', (request, response) => {
  console.log(request)
  let addObj = request.body;
  fs.readFile("./server/db/catalogData.json", 'utf-8',
    (err, data) => {
      if (err) {
        response.sendStatus(500, 'catalog not found')
      } else {
        let catalog = JSON.parse(data);
        let id = 1 + Math.max(...catalog.map(el => el.id_product));
        catalog.push(Object.assign({}, addObj, {id_product: id}));
        fs.writeFile("./server/db/catalogData.json", JSON.stringify(catalog, null, " "), err => {
          //response.json(catalog)
          response.send(catalog);
        })
      }
    })
})

// put new item to basket
server.post('/tobasket.json', (request, response) => {
  let addObj = request.body;
  fs.readFile("./server/db/getBasket.json", 'utf-8',
    (err, data) => {
      if (!err) {
        let basket = JSON.parse(data);
        let inBasket = basket.contents.find(b => b.id_product === addObj.id_product);
        if (inBasket) { // товара не доожно быть в корзине
          response.sendStatus(500, "Can't create existing item")
        } else {
          basket.contents.push(Object.assign({}, addObj, {quantity: 1}));
          fs.writeFile("./server/db/getBasket.json", JSON.stringify(basket, null, " "), err => {
            response.json({'result': err ? 0 : 1})
          })
        }
      } else {
        response.json({'result': 0})
      }
    })
})

// change quantity for item in basket
server.put('/changecart.json/:id', (request, response) => {
  let Obj = request.body;
  fs.readFile("./server/db/getBasket.json", 'utf-8',
    (err, data) => {
      if (!err) {
        let basket = JSON.parse(data);
        let delta = request.body.delta;
        let id = +request.params.id;
        let inBasket = basket.contents.find(b => b.id_product === id);
        if (inBasket.quantity + delta <= 0) {
          response.sendStatus(500, "Can't remove unexisting item")
        } else {
          inBasket.quantity += delta;
          fs.writeFile("./server/db/getBasket.json", JSON.stringify(basket, null, " "), err => {
            response.json({'result': err ? 0 : 1})
          })
        }
      } else {
        response.json({'result': 0})
      }
    })
})

server.listen(8880, () => {
  console.log('server listen @8880...');
});


