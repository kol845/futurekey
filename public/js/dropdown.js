/*contains all the logic that makes the dropdown date picker functional*/
function chooseElement(elem){
    console.log(elem);
}
function toggleMe(elem){
    const bol = elem.classList.contains('hide');
    if(bol) elem.classList.remove("hide");
    else elem.classList.add("hide");
}
function getDT(){
    year = []
    for(i=2020;i<=2050;i++){
        year.push(i);
    }
    month = []
    for(i=1;i<=12;i++){
        month.push(i);
    }
    day = []
    for(i=1;i<=31;i++){
        day.push(i);
    }
    hour = []
    for(i=0;i<=23;i++){
        hour.push(i);
    }
    minute = []
    for(i=0;i<=59;i++){
        minute.push(i);
    }
    dt = {'year':year, 'month':month, 'day':day, 'hour':hour, 'minute':minute};
    return dt;
}
exports.getDT = getDT;