<?php

namespace App\Events;

use Carbon\Carbon;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class HelloWorld implements ShouldBroadcast
{
    use SerializesModels, InteractsWithSockets, Queueable;


    /**
     * Create a new event instance.
     */
    public function __construct(private Carbon $when, int $delay = 15)
    {
        $this->delay = $delay;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('public'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'event';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'text' => __('messages.hello_message'),
            'when' => $this->when
        ];
    }
}
