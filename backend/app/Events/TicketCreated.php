<?php

namespace App\Events;

use App\Models\Tickets;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $ticket;

    public function __construct(Tickets $ticket)
    {
        $this->ticket = $ticket->load(['customer', 'status', 'category']);
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('tickets-channel'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ticket.created';
    }
}
