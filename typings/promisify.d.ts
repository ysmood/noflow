
declare module "yaku/lib/promisify" {
    import Promise from "yaku";

    function self (fn: Function, thisArg?: any): (...args) => Promise<any>

    export = self;
}
