export const parseIntParam = async (targetParam, defaultValue) => {
    const intParam = parseInt(targetParam, 10)
    return Number.isNaN(intParam) ? defaultValue : intParam
}