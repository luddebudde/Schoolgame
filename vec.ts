export type Vec2 = {
    x: number
    y: number
}

export const add = (value1: Vec2, value2: Vec2) => {
    return {x: value1.x + value2.x, y: value1.y + value2.y }
}

export const multVar = (value: Vec2, product: number) => {
    return {x: value.x * product, y: value.y * product}
}