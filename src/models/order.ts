import Client from "../database"

export interface OrderProduct {
  product_id: number,
  quantity: number
}

export interface Order {
  id?:number;
  products: OrderProduct[];
  user_id: number;
  status: boolean;
}

export class OrderStore {
  async index (): Promise<Order[]> {
    try {
      const connection = await Client.connect()
      const sql = "SELECT * FROM orders"

      const {rows} = await connection.query(sql)

      const orderProductsSql = "SELECT product_id, quantity FROM order_products WHERE order_id=($1)"
      const orders = []

      for (const order of rows) {
        const {rows: orderProductRows} = await connection.query(orderProductsSql, [order.id])
        orders.push({
          ...order,
          products: orderProductRows
        })
      }

      connection.release()

      return orders
    } catch (err) {
      throw new Error(`Could not get orders. ${err}`)
    }
  }

  async create (order: Order): Promise<Order> {
    const {products, status, user_id} = order

    try {
      const sql = "INSERT INTO orders (user_id, status) VALUES($1, $2) RETURNING *"
      const connection = await Client.connect()
      const {rows} = await connection.query(sql, [user_id, status])
      const order = rows[0]

      const orderProductsSql = "INSERT INTO order_products (order_id, product_id, quantity) VALUES($1, $2, $3) RETURNING product_id, quantity"
      const orderProducts = []

      for (const product of products) {
        const {product_id, quantity} = product

        const {rows} = await connection.query(orderProductsSql, [order.id, product_id, quantity])

        orderProducts.push(rows[0])
      }

      connection.release()

      return {
        ...order,
        products: orderProducts
      }
    } catch (err) {
      throw new Error(`Could not add new order for user ${user_id}. ${err}`)
    }
  }

  async read (id: number): Promise<Order> {
    try {
      const sql = "SELECT * FROM orders WHERE id=($1)"
      const connection = await Client.connect()
      const {rows} = await connection.query(sql, [id])
      const order = rows[0]

      const orderProductsSql = "SELECT product_id, quantity FROM order_products WHERE order_id=($1)"
      const {rows: orderProductRows} = await connection.query(orderProductsSql, [id])

      connection.release()

      return {
        ...order,
        products: orderProductRows
      }
    } catch (err) {
      throw new Error(`Could not find order ${id}. ${err}`)
    }
  }
}
  
  