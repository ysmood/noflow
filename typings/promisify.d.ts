
declare module "yaku/lib/promisify" {
    import Promise from "yaku";

    function self<T> (fn: T, thisArg?: any): Promise<T>

    export = self;
}
