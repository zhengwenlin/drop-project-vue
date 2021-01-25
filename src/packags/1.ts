interface A {
  name: string,
  list: any []  
}
/**
 * type B = {
      list: any[];
   }
 */
type B = Omit<A, 'name'>