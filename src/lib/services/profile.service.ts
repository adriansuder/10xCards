import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../db/database.types';
import type { UpdateProfileCommand, UserProfileDto } from '../../types';

/**
 * A service class for handling user profile-related operations.
 */
export class ProfileService {
  /**
   * Retrieves the profile for a given user.
   * @param supabase - The Supabase client instance.
   * @param userId - The ID of the user whose profile is to be retrieved.
   * @returns A promise that resolves to the user's profile DTO.
   * @throws Will throw an error if the profile is not found or if a database error occurs.
   */
  async getUserProfile(supabase: SupabaseClient<Database>, userId: string): Promise<UserProfileDto> {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Log the error for debugging purposes
      console.error('Error fetching user profile:', error);
      // Throw a more specific error if the profile is not found
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found.');
      }
      // Throw a generic error for other database issues
      throw new Error('A database error occurred while fetching the user profile.');
    }

    if (!profile) {
      throw new Error('User profile not found.');
    }

    return profile;
  }

  /**
   * Updates the profile for a given user.
   * @param supabase - The Supabase client instance.
   * @param command - The command object containing userId and fields to update.
   * @returns A promise that resolves to the updated user profile DTO.
   * @throws Will throw an error if the profile is not found or if a database error occurs.
   */
  async updateProfile(supabase: SupabaseClient<Database>, command: UpdateProfileCommand): Promise<UserProfileDto> {
    const { userId, default_ai_level } = command;

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ default_ai_level })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      // Throw a more specific error if the profile is not found
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found.');
      }
      // Throw a generic error for other database issues
      throw new Error('A database error occurred while updating the user profile.');
    }

    if (!updatedProfile) {
      throw new Error('User profile not found.');
    }

    return updatedProfile;
  }
}

/**
 * Retrieves the profile for the currently authenticated user.
 * This is a convenience function that wraps the service method.
 *
 * @param supabase - The Supabase client instance, which holds the user's session.
 * @returns A promise that resolves to the user's profile DTO, or null if no user is authenticated.
 * @throws Will throw an error if the database operation fails.
 */
export async function getProfile(supabase: SupabaseClient<Database>): Promise<UserProfileDto | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
    throw new Error('Database operation failed.');
  }

  return profile;
}

export const profileService = new ProfileService();
