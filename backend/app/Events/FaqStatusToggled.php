<?php

namespace App\Events;

use App\Models\Faqs;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FaqStatusToggled implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $faq;

    /**
     * Create a new event instance.
     */
    public function __construct(Faqs $faq)
    {
        $this->faq = $faq;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [new Channel('faqs')];
    }

    public function broadcastAs(): string
    {
        return 'faq.toggled';
    }
}