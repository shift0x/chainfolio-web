export function formatNumber(number){
    return number > 1 ?
        number.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) :
        number.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8})
}