import { Product, ProductStore } from '../../models/product';

const productModel = new ProductStore();


describe('Testing Product Model', () => {
    describe('create method', () => {
        it('should successfully add the product to database and return the added product', async () => {
            let result = await productModel.create({name: 'coffee',
            price: 5,
        });
            expect(result).toEqual({id:1, name: 'coffee', price: 5})
        });
    });
    
    describe('index method', () => {
        it('should return all availale products', async () => {
            const result = await productModel.index();

            expect(result.length).toEqual(1);
            expect(result[0].name).toEqual('coffee');
        });
    });
},)