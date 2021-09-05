/* eslint-disable no-underscore-dangle */
const _prompts = require('prompts')
const { CLI_NAME_UPPER } = require('../config')

/**
 * Very thin wrapper around the prompts library. Adds:
 *   - Handling of Ctrl + C event to abort program execution entirely.
 *   - Message property can be provided as an array of strings for multiline text.
 *
 * @param {*} args agrs object is passed directly into prompts library
 * @returns Promise returned by prompts
 */
function prompts(args) {
    // dad su
    let finalMessage = args.message
    if (Array.isArray(args.message)) {
        finalMessage = args.message.reduce((acc, item, i) => {
            if (i > 0) return `${acc}\n  ${item}`
            return item
        })
    }

    return _prompts(
        { ...args, message: finalMessage },
        {
            onCancel: () => {
                process.stdout.write(
                    "Caught interrupt sequence, aborting execution. I'll be here if you need me.\n".yellow,
                )
                process.exit(0)
            },
        },
    )
}

/**
 * Lodash _.get() function.
 * https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
 *
 * @param {*} obj object to look for property in
 * @param {*} path path to property
 * @param {*} defaultValue returned if value is not found
 * @returns property value or default value if it's not found
 */
function lodashGet(obj, path, defaultValue = undefined) {
    const travel = (regexp) =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
    return result === undefined || result === obj ? defaultValue : result
}

/**
 * Returns a promise that resolves in <S> seconds. Can be handy to pause script execution.
 *
 * @param {*} s seconds to sleep
 * @returns Promise that resolves in <S> seconds
 */
function sleepSeconds(s) {
    return new Promise((resolve) => setTimeout(resolve, s * 1000))
}

/**
 * Generates random alphanumeric string.
 *
 * @param {*} len length of the generated alphanumeric string
 */
function genHash(len = 50) {
    return Array(len)
        .fill(null)
        .map(() => Math.random().toString(36).substring(2))
        .join('')
        .substring(0, len)
}

/**
 * Checks whether a value is a plain object.
 */
function isObject(val) {
    return (
        val !== null &&
        typeof val === 'object' &&
        val.constructor.name === 'Object' &&
        Object.prototype.isPrototypeOf.call(Object.getPrototypeOf(val), Object)
    )
}

/**
 * Fetch var from system environment.
 *
 * @param {*} varName name of the var to get from environment
 * @returns var
 */
function getFeatureFlag(varName) {
    const name = `FF_${CLI_NAME_UPPER}_${varName}`
    return {
        name,
        value: process.env[name],
    }
}

module.exports = { prompts, lodashGet, sleepSeconds, genHash, isObject, getFeatureFlag }
