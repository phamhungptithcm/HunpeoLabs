import { beforeEach, expect, it, vi } from 'vitest';
import type { UserRecord } from 'firebase-admin/auth';
vi.mock('server-only', () => ({}));
const auth = vi.hoisted(() => ({ getUserByEmail: vi.fn(), getUsers: vi.fn() }));
vi.mock('@/lib/firebase-admin', () => ({ blogAuth: () => auth }));
import { authorGoogleProfile, legacyGooglePhotos, verifiedGooglePhoto } from '@/lib/blog/google-profile';
import { publicComment } from '@/lib/blog/comments';
const photo = 'https://lh3.googleusercontent.com/a/example=s96-c';
const user = (change: Partial<UserRecord> = {}) => ({uid:'example',email:'writer@example.test',emailVerified:true,disabled:false,photoURL:photo,providerData:[{providerId:'google.com',photoURL:photo}],...change}) as UserRecord;
beforeEach(() => vi.resetAllMocks());
it('accepts only verified active Google identities and sanitized profile URLs', () => {
 expect(verifiedGooglePhoto(user())).toBe(photo);
 for (const change of [{disabled:true},{emailVerified:false},{providerData:[]},{providerData:[{providerId:'google.com',photoURL:'https://evil.test/a'}]}]) expect(verifiedGooglePhoto(user(change as Partial<UserRecord>))).toBeUndefined();
});
it('binds author to server identity and refuses unavailable or non-Google accounts', async () => {
 auth.getUserByEmail.mockResolvedValue(user());
 expect(await authorGoogleProfile('writer@example.test')).toEqual({googleUid:'example',googleEmail:'writer@example.test',googleAvatar:photo});
 auth.getUserByEmail.mockResolvedValue(user({providerData:[]}));
 await expect(authorGoogleProfile('writer@example.test')).rejects.toThrow('GOOGLE_ACCOUNT_REQUIRED');
 auth.getUserByEmail.mockRejectedValue({code:'auth/user-not-found'});
 await expect(authorGoogleProfile('missing@example.test')).rejects.toThrow('GOOGLE_ACCOUNT_REQUIRED');
 auth.getUserByEmail.mockRejectedValue(new Error('offline'));
 await expect(authorGoogleProfile('writer@example.test')).rejects.toThrow('AUTH_UNAVAILABLE');
});
it('deduplicates and caps legacy lookups; provider failure retains initials fallback', async () => {
 auth.getUsers.mockResolvedValue({users:[user()],notFound:[]});
 expect((await legacyGooglePhotos(['example','example'])).get('example')).toBe(photo);
 expect(auth.getUsers).toHaveBeenLastCalledWith([{uid:'example'}]);
 await legacyGooglePhotos(Array.from({length:120},(_,i)=>String(i)));
 expect(auth.getUsers.mock.calls.at(-1)![0]).toHaveLength(100);
 auth.getUsers.mockRejectedValue(new Error('offline'));
 expect((await legacyGooglePhotos(['example'])).size).toBe(0);
});
it('projects avatar without account identity and erases deleted comment appearance', () => {
 const comment = {id:'c',postId:'p',parentId:'',uid:'private',name:'Reader',avatar:photo,text:'Hi',status:'approved',revision:1,createdAt:'2026-10-03',updatedAt:'2026-10-03',badge:''};
 const output = publicComment(comment);
 expect(output.avatar).toBe(photo);expect(output).not.toHaveProperty('uid');expect(output).not.toHaveProperty('email');
 expect(publicComment({...comment,status:'deleted'})).toMatchObject({avatar:'',name:'',text:'',badge:''});
 expect(publicComment({...comment,avatar:'javascript:alert(1)'}).avatar).toBe('');
});
