const cron = require('node-cron');
const FlightBooking = require('../models/FlightBooking');
const Notification = require('../models/Notification');
const { sendEmail } = require('./notificationService');

/**
 * Smart Scheduler Service
 * Runs background tasks using node-cron.
 * 1. Checks flight bookings every 5 minutes
 * 2. Calculates time to departure
 * 3. Triggers 90m, 60m, and 30m boarding reminders
 */

const startBoardingReminders = () => {
  console.log('⏰ Scheduler started: Boarding reminder jobs registered');

  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('🔄 Running scheduled boarding reminder check...');
      
      // Find all active bookings and populate user (for email) and flight (for departure time)
      const activeBookings = await FlightBooking.find({ isActive: true })
        .populate('userId', 'name email')
        .populate('flightId');

      const now = new Date();

      for (const booking of activeBookings) {
        if (!booking.flightId || !booking.userId) continue;

        const flight = booking.flightId;
        const user = booking.userId;
        const departureTime = new Date(flight.departureTime);
        
        // Flight already departed, mark booking inactive
        if (now > departureTime) {
          booking.isActive = false;
          await booking.save();
          continue;
        }

        // Calculate minutes until departure
        const diffMs = departureTime - now;
        const diffMinutes = Math.floor(diffMs / 1000 / 60);

        let reminderType = null;
        let message = '';

        // Check thresholds and prevent duplicate sending
        if (diffMinutes <= 90 && diffMinutes > 60 && !booking.reminders_sent.at_90_min) {
          reminderType = 'at_90_min';
          message = `Your flight ${flight.flightNumber} to ${flight.destinationAirport} departs in 90 minutes. Check-in counters will close soon. Please proceed to security.`;
        } else if (diffMinutes <= 60 && diffMinutes > 30 && !booking.reminders_sent.at_60_min) {
          reminderType = 'at_60_min';
          message = `Boarding starts soon for flight ${flight.flightNumber}. Please head to Terminal ${flight.terminal}, Gate ${flight.gate}.`;
        } else if (diffMinutes <= 30 && diffMinutes > 0 && !booking.reminders_sent.at_30_min) {
          reminderType = 'at_30_min';
          message = `FINAL CALL: Flight ${flight.flightNumber} is boarding NOW at Gate ${flight.gate}. Gates close 15 minutes before departure.`;
        }

        // If a threshold was crossed and not sent yet, trigger the notification
        if (reminderType) {
          // 1. Create In-App Notification
          await Notification.create({
            userId: user._id,
            title: `Flight Reminder: ${diffMinutes} min to departure`,
            message,
            type: 'boarding',
            icon: '✈️',
            metadata: {
              flightNumber: flight.flightNumber,
              gate: flight.gate,
              terminal: flight.terminal
            }
          });

          // 2. Send Email
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-w-md; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5;">AirAssist Smart Reminder</h2>
              <p>Hello <strong>${user.name}</strong>,</p>
              <p>${message}</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0;"><strong>Flight:</strong> ${flight.flightNumber} (${flight.airlineName})</p>
                <p style="margin: 5px 0 0 0;"><strong>Terminal:</strong> ${flight.terminal}</p>
                <p style="margin: 5px 0 0 0;"><strong>Gate:</strong> ${flight.gate}</p>
                <p style="margin: 5px 0 0 0;"><strong>Status:</strong> ${flight.flightStatus}</p>
              </div>
              <p style="color: #64748b; font-size: 12px; margin-top: 30px;">This is an automated reminder from the Smart Airport Assistant System.</p>
            </div>
          `;
          
          await sendEmail(user.email, `Flight ${flight.flightNumber} Departure Reminder`, emailHtml);

          // 3. Mark as sent to prevent duplicates
          booking.reminders_sent[reminderType] = true;
          await booking.save();
        }
      }
    } catch (error) {
      console.error('❌ Scheduler error in boarding reminder loop:', error);
    }
  });
};

module.exports = {
  startBoardingReminders
};
