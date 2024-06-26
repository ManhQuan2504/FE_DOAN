export const MANAGER = "manager";

export const PATH = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  MANAGER:{
    DASHBOARD: `/${MANAGER}`,
    LOGIN: `/${MANAGER}/login`,
    PRODUCTS: `/${MANAGER}/products`,
    PRODUCTTEST: `/${MANAGER}/productstest`,
    USERS: `/${MANAGER}/users`,
    EMPLOYEES: `/${MANAGER}/employees`,
    FUNCTIONS: `/${MANAGER}/functions`,
    ACCOUNT: `/${MANAGER}/account`,
    CATEGORIES: `/${MANAGER}/categories`,
    UOMS: `/${MANAGER}/uoms`,
    ROLES: `/${MANAGER}/roles`,
  },
  USER: {
    PRODUCT: `product`
  }
}
