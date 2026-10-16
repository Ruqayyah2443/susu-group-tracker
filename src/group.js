import {parseMoney, formatMoney} from './money.js'
import {SusuError} from './errors.js'

export class SusuGroup {
    constructor(weeklyContribution) {
      const amount = parseMoney(weeklyContribution)
      if (amount <= 0) {
        throw new SusuError('Weekly contribution must be a positive amount')
      }
      this.weeklyAmount = amount
      this.members = []
      this.week = 1
      this.paidThisWeek = new Map()
      this.payouts = []

    }

    get isComplete() {
    return this.members.length > 0 && this.payouts.length === this.members.length;
    }

    get hasStarted() {
        return (
            this.payouts.length > 0 ||                                                                   [...this.paidThisWeek.values()].some((paid) => paid > 0)
        );
    }

    find(name) {
        const key = String(name ?? '').trim().toLowerCase();
        return this.members.find((m) => m.key === key);
    }

    addMember(name) {
        const clean = String(name ?? '').trim();
        if (!clean) throw new SusuError('Member name cannot be empty.');
        if (this.hasStarted) {
        throw new SusuError('Cannot add members after contributions have started.');
        }
        if (this.find(clean)) {
        throw new SusuError(`Member "${clean}" already exists.`);
        }
        const key = clean.toLowerCase();
        this.members.push({ key, name: clean });
        this.paidThisWeek.set(key, 0);
        return clean;
    }


    recordContribution(name, amount) {
        if (this.isComplete) throw new SusuError('This group has finished its cycle.');
        const member = this.find(name);
        if (!member) throw new SusuError(`Unknown member "${String(name).trim()}".`);

        const pesewas = parseMoney(amount);
        if (pesewas <= 0) throw new SusuError('Amount must be greater than zero.');

        const owed = this.weeklyAmount - this.paidThisWeek.get(member.key);
        if (pesewas > owed) {
        throw new SusuError(
            `${member.name} only owes ${formatMoney(owed)} this week; cannot pay ${formatMoney(pesewas)}.`
        );
        }
        this.paidThisWeek.set(member.key, this.paidThisWeek.get(member.key) + pesewas);
        return { member: member.name, paid: formatMoney(pesewas), stillOwes: formatMoney(owed - pesewas) };
    }

    owing() {
        return this.members
        .map((m) => ({ name: m.name, owed: this.weeklyAmount - this.paidThisWeek.get(m.key) }))
        .filter((x) => x.owed > 0)
        .map((x) => ({ name: x.name, amount: formatMoney(x.owed) }));
    }


    closeWeek() {
        if (this.isComplete) throw new SusuError('This group has finished its cycle.');
        if (this.members.length < 2) {
        throw new SusuError('A group needs at least 2 members before a week can close.');
        }

        const owing = this.owing();
        if (owing.length > 0) {
        return { closed: false, owing };
        }

        const recipient = this.members[this.payouts.length];
        const payout = {
        week: this.week,
        member: recipient.name,
        amount: formatMoney(this.weeklyAmount * this.members.length),
        };
        this.payouts.push(payout);

        if (!this.isComplete) {
        this.week += 1;
        for (const m of this.members) this.paidThisWeek.set(m.key, 0);
        }
        return { closed: true, payout, complete: this.isComplete };
    }

    report() {
        const owing = this.owing();
        const owingNames = new Set(owing.map((o) => o.name));
        return {
        week: this.week,
        complete: this.isComplete,
        weeklyAmount: formatMoney(this.weeklyAmount),
        nextRecipient: this.isComplete
            ? null
            : this.members[this.payouts.length]?.name ?? null,
        paidInFull: this.members.filter((m) => !owingNames.has(m.name)).map((m) => m.name),
        owing,
        payouts: this.payouts.map((p) => ({ ...p })),
        };
    }

}



