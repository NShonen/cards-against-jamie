import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Users, PlayCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Cards Against Jamie
          </h1>
          <p className="text-xl text-muted-foreground max-w-[750px] mx-auto">
            An online implementation of Cards Against Humanity. Join a room or
            create your own to start playing!
          </p>
        </div>

        {/* Game Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-primary transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-6 w-6" />
                Create Room
              </CardTitle>
              <CardDescription>
                Start a new game and invite your friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Customize game settings</li>
                <li>Set win conditions</li>
                <li>Optional password protection</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <a
                  href="/game-room"
                  className="flex items-center justify-center gap-2"
                >
                  Create New Room
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 hover:border-primary transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                Join Room
              </CardTitle>
              <CardDescription>
                Join an existing game with friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Enter room code</li>
                <li>Choose your player name</li>
                <li>Join the fun instantly</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <a
                  href="/game-room"
                  className="flex items-center justify-center gap-2"
                >
                  Join Existing Room
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <Separator className="my-8" />
          <p className="text-sm text-muted-foreground">
            Made with ❤️ by Jamie. Not affiliated with Cards Against Humanity
            LLC.
          </p>
        </div>
      </div>
    </main>
  );
}
