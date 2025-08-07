import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { View, Text } from 'react-native'
import { Link } from 'expo-router'


export default function HomeScreen() {
  const { user } = useUser()

  return (
    <View style={{ padding: 20 }}>
      <SignedIn>
        <Text>Welcome, {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in"><Text>Sign In</Text></Link>
        <Link href="/(auth)/sign-up"><Text>Sign Up</Text></Link>
      </SignedOut>
    </View>
  )
}
