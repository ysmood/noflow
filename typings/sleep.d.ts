
declare module "yaku/lib/sleep" {
    import Promise from "yaku";

    function self (span: number, val: any): Promise<any>

    export = self;
}
