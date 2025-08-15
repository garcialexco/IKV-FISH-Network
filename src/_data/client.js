module.exports = {
    name: "FISH Network",
    address: {
        lineOne: "First Address Line",
        lineTwo: "Second Address Line",
        city: "Denver",
        state: "CO",
        zip: "80206",
        country: "US",
    },
    socials: {
        facebook: "https://www.facebook.com/",
        instagram: "https://www.instagram.com/",
    },
    //! Make sure you include the file protocol (e.g. https://) and that NO TRAILING SLASH is included
    domain: "https://www.example.com",
    // Passing the isProduction variable for use in HTML templates
    isProduction: process.env.ELEVENTY_ENV === "PROD",
};
