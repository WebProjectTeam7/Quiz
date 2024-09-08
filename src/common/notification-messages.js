export const NOTIFICATION_QUIZ_INVITE = (user, quizTitle) => `${user}, has invited you to quiz - ${quizTitle}`;

export const NOTIFICATION_QUIZ_UNINVITE = (quizTitle) => `Your invitation to quiz - ${quizTitle} has expired`;

export const NOTIFICATION_ORGANIZATION_INVITE = (organizationName) => `You have been invited to ${organizationName} organization`;

export const NOTIFICATION_ORGANIZATION_REMOVE = (organizationName) => `You have been removed from ${organizationName} organization`;