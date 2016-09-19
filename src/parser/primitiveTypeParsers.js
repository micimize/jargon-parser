
export function string({tokens: [value, ...remainder]}){
    return { value, remainder }
}
export function number({tokens: [value, ...remainder]}){
    return { value: Number(value), remainder }
}
export function integer({tokens: [value, ...remainder]}){
    return { value: parseInt(value), remainder }
}

export function boolean({tokens: [value, ...remainder]}){
    if (/^(true|false)$/.test(value)) {
        return {value: value === 'true', remainder}
    } else {
        return { value: true, remainder: [value, ...remainder] }
    }
}

/*
export function null({tokens}){
    if (value == 'null') {
        return {value: null, remainder}
    } else {
        return { remainder: [value, ...remainder] }
    }
}
*/
