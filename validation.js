module.exports = {
    isAlphaNumericOnly: function (input) {
      var letterNumberRegex = /^[0-9a-zA-Z]+$/;
      if (input.match(letterNumberRegex)) {
        return true;
      }
      return false;
    },
    isLongEnough: function (input) {
      if (input.length >= 6) {
        return true;
      }
      return false;
    },
  };