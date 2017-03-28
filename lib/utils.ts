"use strict";

export function isFunction (value): boolean {
    return typeof value === "function";
}

export function isArray (value): boolean {
    return value instanceof Array;
}
