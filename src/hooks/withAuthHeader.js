const withAuthHeader = (args = {}) => ({
    headers: {
        cookie: `PHPSESSID=${process.env.PHPSESSID}; Path=/;`
    },
    ...args
})

export default withAuthHeader; 