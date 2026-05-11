import { useUser as useClerkUser } from '@clerk/react-router';

const useUser = () => {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();

  const user = isLoaded && isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        name: clerkUser.fullName ?? clerkUser.firstName ?? '',
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        image: clerkUser.imageUrl ?? null,
      }
    : null;

  return {
    user,
    data: user,
    loading: !isLoaded,
    refetch: () => {},
  };
};

export { useUser };
export default useUser;