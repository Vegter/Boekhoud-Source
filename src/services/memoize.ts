/**
 * Caching decorators
 */

/**
 * Hold any method or accessor result in a WeakMap
 *
 * The object references in the keys are held weakly,
 * meaning that they are a target of garbage collection (GC) if there is no other reference to the object anymore.
 */
const Cache: Record<string, Record<string, WeakMap<Object, any>>> = {}

/**
 * Clears the cache for a specific class
 *
 * Method decorator
 */
export function clear() {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        if (descriptor.value) {
            descriptor.value = getClearCacheMethod(target, descriptor.value)
        } else {
            throw Error("Only put clear() decorator on method")
        }
    }
}

/**
 * Memoize a method or accessor result
 *
 * Method or accessor decorator
 */
export function memoize() {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        if (descriptor.value) {
            descriptor.value = getCachedResultMethod(target, propertyKey, descriptor.value)
        } else if (descriptor.get) {
            descriptor.get = getCachedResultMethod(target, propertyKey, descriptor.get)
        } else {
            throw Error("Only put memoize() decorator on method or getter")
        }
    }
}

/**
 * Returns a unique key to identify cached results
 */
function mainKey(target: object) {
    // target: Either the constructor function of the class for a static member
    //         or the prototype of the class for an instance member

    // @ts-ignore
    if (target.name) {
        // @ts-ignore
        return `__CLASS__${target.name}`
    } else {
        return `__INSTANCE__${target.constructor.name}`
    }
}

/**
 * Clears the cache for the specific class or instance
 */
function getClearCacheMethod(target: object, originalMethod: (...args: any[]) => any) {
    return function(...args: any[]) {
        delete Cache[mainKey(target)]
        // @ts-ignore
        return originalMethod.apply(this, args)
    }
}

/**
 * Returns a method that returns a cached result if available
 * If no cached result is available then the result of the original method is returned and saved in the cache
 */
function getCachedResultMethod(target: object, propertyKey: string, originalMethod: (...args: any[]) => any) {
    const key = mainKey(target)

    return function(...args: any[]) {
        // @ts-ignore
        const instance = this

        if (args.length > 0) {
            throw Error("Only memoize methods without arguments")
        }
        if (Cache[key] && Cache[key][propertyKey] && Cache[key][propertyKey].has(instance)) {
            // Return cached result
        } else {
            // Execute the original method, save the result in the cache
            Cache[key] = Cache[key] ?? {}
            Cache[key][propertyKey] = Cache[key][propertyKey] ?? new WeakMap()
            Cache[key][propertyKey].set(instance, originalMethod.apply(instance, args))
        }
        // Return the cached result
        return Cache[key][propertyKey].get(instance)
    }
}
