import amqp from 'amqplib';
import { env } from '../config/env.js';
import { socketEmitter } from '../utils/socket.emitter.js';
import Notification from '../models/notification.model.js';

let channel: amqp.Channel;

export const startConsumer = async () => {
    try {
        const connection = await amqp.connect(env.RABBITMQ_URL);
        channel = await connection.createChannel();

        const queue = 'notification_queue';
        await channel.assertQueue(queue, { durable: true });

        // 1. Hospital
        await channel.assertExchange('hospital_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'hospital_events', 'HOSPITAL_REGISTERED');
        await channel.bindQueue(queue, 'hospital_events', 'HOSPITAL_UPDATED');
        await channel.bindQueue(queue, 'hospital_events', 'HOSPITAL_DELETED');

        // 2. Booking
        await channel.assertExchange('booking_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'booking_events', 'BOOKING_REGISTERED');
        await channel.bindQueue(queue, 'booking_events', 'BOOKING_UPDATED');
        await channel.bindQueue(queue, 'booking_events', 'BOOKING_CANCELLED');

        // 3. Doctor
        await channel.assertExchange('doctor_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'doctor_events', 'DOCTOR_REGISTERED');
        await channel.bindQueue(queue, 'doctor_events', 'DOCTOR_UPDATED');
        await channel.bindQueue(queue, 'doctor_events', 'DOCTOR_DELETED');

        // 4. Blood Bank
        await channel.assertExchange('blood_bank_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'blood_bank_events', 'STOCK_CREATED');
        await channel.bindQueue(queue, 'blood_bank_events', 'STOCK_UPDATED');

        // 5. Blood Donor
        await channel.assertExchange('blood_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'blood_events', 'DONOR_REGISTERED');
        await channel.bindQueue(queue, 'blood_events', 'DONOR_UPDATED');
        await channel.bindQueue(queue, 'blood_events', 'DONOR_DELETED');

        // 6. User
        await channel.assertExchange('user_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'user_events', 'USER_REGISTERED');
        await channel.bindQueue(queue, 'user_events', 'user.deleted');

        // 7. Patient
        await channel.assertExchange('patient_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'patient_events', 'PATIENT_REGISTERED');

        // 8. Ambulance
        await channel.assertExchange('ambulance_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'ambulance_events', 'AMBULANCE_REGISTERED');
        await channel.bindQueue(queue, 'ambulance_events', 'AMBULANCE_UPDATED');
        await channel.bindQueue(queue, 'ambulance_events', 'AMBULANCE_DELETED');

        // 9. Staff
        await channel.assertExchange('staff_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'staff_events', 'STAFF_REGISTERED');
        await channel.bindQueue(queue, 'staff_events', 'STAFF_UPDATED');

        // 10. Lab & Test & Report
        await channel.assertExchange('lab_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'lab_events', 'LAB_REGISTERED');
        await channel.bindQueue(queue, 'lab_events', 'LAB_UPDATED');
        await channel.bindQueue(queue, 'lab_events', 'LAB_DELETED');
        await channel.assertExchange('test_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'test_events', 'TEST_REGISTERED');
        await channel.assertExchange('report_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'report_events', 'REPORT_REGISTERED');
        await channel.bindQueue(queue, 'report_events', 'REPORT_UPDATED');

        // 11. Pharmacy
        await channel.assertExchange('pharmacy_queue', 'direct', { durable: true });
        await channel.bindQueue(queue, 'pharmacy_queue', 'PHARMACY_UPDATED');
        await channel.bindQueue(queue, 'pharmacy_queue', 'PHARMACY_DELETED');

        // 12. Speciality
        await channel.assertExchange('speciality_events', 'direct', { durable: true });
        await channel.bindQueue(queue, 'speciality_events', 'SPECIALITY_REGISTERED');

        console.log(`📥 Notification Consumer started on queue: ${queue}`);

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;

                console.log(`📩 Received event: ${routingKey}`, content);

                // DB Integration
                if (routingKey === 'BOOKING_REGISTERED') {
                    Notification.create({
                        userIds: content.userId ? [content.userId] : [],
                        hospitalIds: content.hospitalId ? [content.hospitalId] : [],
                        doctorIds: content.doctorId ? [content.doctorId] : [],
                        message: `New Booking registered for ${content.patient_name || 'Patient'}`
                    }).catch(err => console.error('Failed to save booking notification', err));
                }

                if (routingKey === 'DOCTOR_REGISTERED') {
                    Notification.create({
                        superAdminIds: [1],
                        hospitalIds: content.hospitalId ? [content.hospitalId] : [],
                        doctorIds: [content.doctorId],
                        message: `New Doctor registered: ID ${content.doctorId}. Welcome to the platform!`
                    }).catch(err => console.error('Failed to save consolidated doctor notification', err));
                }

                if (routingKey === 'STAFF_REGISTERED') {
                    Notification.create({
                        superAdminIds: [1],
                        hospitalIds: content.hospitalId ? [content.hospitalId] : [],
                        staffIds: [content.staffId],
                        message: `New Staff registered: ID ${content.staffId}. Welcome to the team!`
                    }).catch(err => console.error('Failed to save consolidated staff notification', err));
                }

                // Special Handler for Hospital Events to alert Superadmin (roleId: 1)
                if (routingKey.startsWith('HOSPITAL_')) {
                    // Assuming Superadmin userId is 1
                    Notification.create({
                        superAdminIds: [1], 
                        message: `[Superadmin Alert] ${routingKey} - Hospital Action Triggered!`
                    }).catch(err => console.error('Failed to save hospital notification', err));

                    socketEmitter.to('role_1').emit('system_event', {
                        message: `[Superadmin Alert] ${routingKey} - Hospital Action Triggered!`,
                        data: content
                    });
                }

                // Global broadcast for all events (including Hospital events)
                socketEmitter.emit('system_event', {
                    message: `[${routingKey}] Event Triggered!`,
                    data: content
                });

                // Specific targeted handlers
                if (routingKey === 'STOCK_UPDATED' || routingKey === 'STOCK_CREATED') {
                    if (content.hospitalId) {
                        socketEmitter.to(`user_${content.hospitalId}`).emit('emergency_alert', {
                            message: `Blood Stock Alert: ${content.bloodGroup} inventory is now ${content.count} units.`,
                            data: content
                        });
                    }
                }
                else if (routingKey === 'DONOR_REGISTERED') {
                    socketEmitter.emit('emergency_alert', {
                        message: `New Blood Donor Registered! (${content.bloodGroup})`,
                        data: content
                    });
                }
                else if (routingKey === 'BOOKING_REGISTERED') {
                    if (content.userId) {
                        socketEmitter.to(`user_${content.userId}`).emit('booking_created', {
                            message: `Booking for ${content.patient_name || 'User'} has been registered successfully! (ID: ${content.bookingId})`,
                            bookingId: content.bookingId
                        });
                    }
                }
                else if (routingKey === 'BOOKING_UPDATED') {
                    if (content.userId) {
                        socketEmitter.to(`user_${content.userId}`).emit('booking_created', {
                            message: `Your booking (ID: ${content.bookingId}) status has been updated.`,
                            bookingId: content.bookingId
                        });
                    }
                }

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('❌ Consumer Error:', error);
    }
};
