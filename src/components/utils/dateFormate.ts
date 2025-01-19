import moment from "moment";
export const fromNow = (date: Date) => {
    // const adjustedDate = moment(date).add(6, 'hours');
    // return adjustedDate.fromNow();
    return moment(date).fromNow();
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