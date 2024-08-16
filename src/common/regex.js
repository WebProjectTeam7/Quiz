export const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{4,32}$/;

export const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

export const PASSWORD_REGEX = /^(.){6,32}$/;

export const NAME_REGEX = /^(.){4,32}$/;

export const HAS_UPPERCASE = /[A-Z]+/;

export const HAS_LOWERCASE = /[a-z]+/;

export const HAS_DIGIT = /[0-9]+/;

export const HAS_SPECIAL_CHAR = /[^A-Za-z0-9]+/;

export const TITLE_REGEX = /^(.){3,64}$/;

export const CONTENT_REGEX = /^(.){3,8192}$/;
