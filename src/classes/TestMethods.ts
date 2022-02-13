export function testPasswordSecurity(password: string): boolean {
    if (password)
        //Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
        return password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/) != null;
    return false;
  }