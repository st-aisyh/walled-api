// DTO
class UserResponse {
    constructor(user) {
        this.username = user.username;
        this.fullname = user.fullname;
        this.email = user.email;
        this.balance = user.balance;
        this.avatar_url = user.avatar_url;
        this.id = user.id;
        if (user.wallet) {
            this.wallet = {
              account_number: user.wallet.account_number,
              balance: user.wallet.balance,
        };
    }
}
}

module.exports = { UserResponse };