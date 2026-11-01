
export class HealthSystem {
  private currentHealth: number;
  private invulnerable = false;
  private invulnerabilityTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly maxHealth = 3,
    private readonly invulnerabilityDuration = 1000
  ) {
    this.currentHealth = maxHealth;
  }

  get health(): number {
    return this.currentHealth;
  }

  get max(): number {
    return this.maxHealth;
  }

  get isInvulnerable(): boolean {
    return this.invulnerable;
  }

  get isDead(): boolean {
    return this.currentHealth <= 0;
  }

  takeDamage(amount: number): boolean {
    if (this.invulnerable || this.isDead) return false;

    this.currentHealth = Math.max(
      0,
      this.currentHealth - amount
    );

    if (!this.isDead) {
      this.invulnerable = true;

      this.invulnerabilityTimer = setTimeout(() => {
        this.invulnerable = false;
      }, this.invulnerabilityDuration);
    }

    return true;
  }

  heal(amount: number): void {
    this.currentHealth = Math.min(
      this.maxHealth,
      this.currentHealth + amount
    );
  }

  destroy(): void {
    if (this.invulnerabilityTimer) {
      clearTimeout(this.invulnerabilityTimer);
    }
  }
}
