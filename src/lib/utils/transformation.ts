/**
 * Simple utility to convert snake_case strings to camelCase
 */
export function snakeToCamel(str: string): string {
    return str.replace(/([-_][a-z])/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
}

/**
 * Simple utility to convert camelCase strings to snake_case
 */
export function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transform object keys to camelCase
 */
export function toCamelCase<T>(obj: any): T {
    if (Array.isArray(obj)) {
        return obj.map((v) => toCamelCase(v)) as any;
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [snakeToCamel(key)]: toCamelCase(obj[key]),
            }),
            {}
        ) as any;
    }
    return obj;
}

/**
 * Recursively transform object keys to snake_case
 */
export function toSnakeCase<T>(obj: any): T {
    if (Array.isArray(obj)) {
        return obj.map((v) => toSnakeCase(v)) as any;
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce(
            (result, key) => ({
                ...result,
                [camelToSnake(key)]: toSnakeCase(obj[key]),
            }),
            {}
        ) as any;
    }
    return obj;
}
