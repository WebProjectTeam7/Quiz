import { ref as dbRef, push, get, update, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase-config';


// CREATE

export const createOrganization = async (organization) => {
    try {
        const orgRef = push(dbRef(db, 'organizations'));
        const organizationId = orgRef.key;
        organization.id = organizationId;

        if (organization.logo) {
            const logoUrl = await uploadOrganizationLogo(organizationId, organization.logo);
            organization.logoUrl = logoUrl;
        }
        delete organization.logo;

        await set(orgRef, organization);

        return { id: organizationId, ...organization };
    } catch (error) {
        console.error('Error creating organization:', error);
        throw new Error('Failed to create organization');
    }
};
export const uploadOrganizationLogo = async (orgId, file) => {
    try {
        const logoRef = storageRef(storage, `organizations/${orgId}/logo`);
        await uploadBytes(logoRef, file);
        const downloadURL = await getDownloadURL(logoRef);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading organization logo:', error);
        throw new Error('Failed to upload organization logo');
    }
};


// RETRIEVE

export const getOrganizationById = async (orgId) => {
    try {
        const orgRef = dbRef(db, `organizations/${orgId}`);
        const snapshot = await get(orgRef);
        if (!snapshot.exists()) {
            throw new Error('Organization not found');
        }
        return { id: orgId, ...snapshot.val() };
    } catch (error) {
        console.error('Error fetching organization by ID:', error);
        throw new Error('Failed to retrieve organization');
    }
};

// UPDATE

export const editOrganization = async (orgId, updatedData, newLogoFile) => {
    try {
        const orgRef = dbRef(db, `organizations/${orgId}`);
        const snapshot = await get(orgRef);
        if (!snapshot.exists()) {
            throw new Error('Organization not found');
        }

        let logoUrl = snapshot.val().logoUrl;
        if (newLogoFile) {
            if (logoUrl) {
                const oldLogoRef = storageRef(storage, logoUrl);
                await deleteObject(oldLogoRef);
            }
            logoUrl = await uploadOrganizationLogo(orgId, newLogoFile);
        }

        const updatedOrg = {
            ...snapshot.val(),
            ...updatedData,
            logoUrl,
            updatedAt: new Date().toISOString(),
        };
        await update(orgRef, updatedOrg);
        return updatedOrg;
    } catch (error) {
        console.error('Error updating organization:', error);
        throw new Error('Failed to update organization');
    }
};

export const addQuizIdToOrganization = async (orgId, quizId) => {
    try {
        const orgRef = dbRef(db, `organizations/${orgId}/quizzes`);
        const snapshot = await get(orgRef);
        let quizzes = snapshot.val() || [];
        quizzes.push(quizId);
        await update(orgRef, quizzes);
    } catch (error) {
        console.error('Error adding quiz ID to organization:', error);
        throw new Error('Failed to add quiz ID to organization');
    }
};

export const removeQuizIdFromOrganization = async (orgId, quizId) => {
    try {
        const orgRef = dbRef(db, `organizations/${orgId}/quizzes`);
        const snapshot = await get(orgRef);
        if (!snapshot.exists()) {
            throw new Error('Organization or quiz list not found');
        }
        let quizzes = snapshot.val() || [];
        quizzes = quizzes.filter(id => id !== quizId);
        await update(orgRef, quizzes);
    } catch (error) {
        console.error('Error removing quiz ID from organization:', error);
        throw new Error('Failed to remove quiz ID from organization');
    }
};

export const joinOrganization = async (orgId, userId) => {
    try {
        const userRef = dbRef(db, `users/${userId}`);
        await update(userRef, { organizationId: orgId });
    } catch (error) {
        console.error('Error joining organization:', error);
        throw new Error('Failed to join organization');
    }
};

export const leaveOrganization = async (userId) => {
    try {
        const userRef = dbRef(db, `users/${userId}`);
        await update(userRef, { organizationId: null, organizationName: null });
    } catch (error) {
        console.error('Error leaving organization:', error);
        throw new Error('Failed to leave organization');
    }
};

export const updateUserWithOrganization = async (username, organizationId, organizationName) => {
    try {
        const userRef = dbRef(db, `users/${username}`);
        const updates = {
            organizationId,
            organizationName
        };

        await update(userRef, updates);
    } catch (error) {
        console.error('Error updating user with organization:', error);
        throw new Error('Failed to update user with organization: ' + error.message);
    }
};
// DELETE