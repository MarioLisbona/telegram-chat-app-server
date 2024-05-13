import moment from "moment";

export function convertToISO8601(dateString) {
  // Define the format of the input string
  var dateFormat = "MMM DD, YYYY hh:mm A";
  // Parse the input string using moment.js library
  var dtObject = moment(dateString, dateFormat);

  // Check if the date is valid
  if (dtObject.isValid()) {
    // Convert the moment object to ISO-8601 format
    var iso8601Date = dtObject.toISOString();
    return iso8601Date;
  } else {
    // Handle invalid date string
    return "Invalid date format";
  }
}
