
declare module "yaku/lib/async" {
    import Promise from "yaku";

    function self (fn: Function): (...args) => Promise<any>

    export = self;
}
