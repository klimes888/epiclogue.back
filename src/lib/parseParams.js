export const parseIntParam = async (targetparam, defaultValue) => {
    const intParam = parseInt(targetparam, 10)
    const result = Number.isNaN(intParam) ? defaultValue : intParam
    return result
}