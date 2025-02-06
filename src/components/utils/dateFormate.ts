import moment from "moment";
// export const fromNow = (date: Date) => {
//     // const adjustedDate = moment(date).add(6, 'hours');
//     // return adjustedDate.fromNow();
//     return moment(date).fromNow();
// };

export const fromNow = (date: Date) => {
    const duration = moment.duration(moment().diff(moment(date)));

    if (duration.asMinutes() < 60) {
        return `${Math.floor(duration.asMinutes())}m`;
    } else if (duration.asHours() < 24) {
        return `${Math.floor(duration.asHours())}h`;
    } else if (duration.asDays() < 7) {
        return `${Math.floor(duration.asDays())}d`;
    } else if (duration.asWeeks() < 4) {
        return `${Math.floor(duration.asWeeks())}w`;
    } else {
        return `${Math.floor(duration.asMonths())}month`;
    }
};


export const fromNowShort = (date: Date) => {
    return moment(date).fromNow(true);
}

export const formatTime = (date: Date) => {
    return moment(date).format("DD MMM YYYY, hh:mm A");
}

// number k format like 1.2k
export const formatNumber = (number: number) => {
    return number > 999 ? (number / 1000).toFixed(1) + "k" : number;
};

export const formatBnNumber = (number: number) => {
    return Intl.NumberFormat("bn-BD").format(number);
};

export const truncate = (str: string, length: number) => {
    // str titlecase
    str = str
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");

    return str.length > length ? str.substring(0, length) + "..." : str;
};