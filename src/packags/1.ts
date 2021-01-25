/**
 * Construct a type with a set of properties K of type T
 */
// type Record<K extends keyof any, T> = {
//     [P in K]: T;
// };

// string | number | symbol
type A = keyof any


type B = Record<string, { name: string }>

/**
 * type B = {
        [x: string]: {
            name: string;
        };
    }
 */

let c: B = {
    xxx: {
        name: 'zf',
    }
}
console.log(c.xxx.name);

