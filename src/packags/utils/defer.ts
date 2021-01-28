interface Defer {
    (): void,
    count: number
}

let aaa: Defer = () => {

};
aaa.count = 1;



interface Getcount {
    (): void,
    count: number
}
const getCount: Getcount = () => {
    getCount.count++;
}
getCount.count = 1
getCount()