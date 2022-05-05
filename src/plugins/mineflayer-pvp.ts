import { StateBehavior, StateMachineTargets } from 'mineflayer-statemachine'
import { Bot } from 'mineflayer'
import { Entity } from 'prismarine-entity'
import 'mineflayer-pvp'

/**
 * Causes the bot to follow the target entity.
 *
 * This behavior relies on the mineflayer-pathfinding plugin to be installed.
 */
export class PVPBehaviorAttackEntity implements StateBehavior {
  readonly bot: Bot
  readonly targets: StateMachineTargets

  stateName: string = 'attackEntity'
  active: boolean = false

  /**
     * How close to the entity should the bot attempt to get?
     */
  followDistance: number = 0

  /**
     * How close to the entity should the bot be before attempting to attack?
     */
  attackDistance: number = 0

  constructor (bot: Bot, targets: StateMachineTargets) {
    this.bot = bot
    this.targets = targets
  }

  onStateEntered (): void {
    this.startAttacking()
  }

  onStateExited (): void {
    this.stopAttacking()
  }

  /**
     * Sets the target entity this bot should attack. If the bot
     * is currently attacking another entity, it will stop attacking
     * that entity and attack this entity instead.
     *
     * If the bot is not currently in this behavior state, the entity
     * will still be assigned as the target entity when this state is
     * entered.
     *
     * Calling this method will update the targets object.
     *
     * @param entity - The entity to follow.
     */
  setAttackTarget (entity: Entity): void {
    if (this.targets.entity === entity) { return }

    this.targets.entity = entity
    this.restart()
  }

  /**
     * Cancels the current path finding operation.
     */
  private stopAttacking (): void {
    void this.bot.pvp.stop()
  }

  /**
     * Starts a new path finding operation.
     */
  private startAttacking (): void {
    const entity = this.targets.entity
    if (entity == null) return

    this.bot.pvp.followRange = this.followDistance
    this.bot.pvp.attackRange = this.followDistance
    void this.bot.pvp.attack(entity)
  }

  /**
     * Stops and restarts this movement behavior. Does nothing if
     * this behavior is not active.
     *
     * Useful if the target entity is updated while this behavior
     * is still active.
     */
  restart (): void {
    if (!this.active) { return }

    this.stopAttacking()
    this.startAttacking()
  }

  /**
     * Gets the distance to the target entity.
     *
     * @returns The distance, or 0 if no target entity is assigned.
     */
   distanceToTarget (): number {
    const entity = this.targets.entity
    if (entity == null) return 0

    return this.bot.entity.position.distanceTo(entity.position)
  }
}
