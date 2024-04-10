import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { ExecutableKey } from '@/domain/Executables/ExecutableKey/ExecutableKey';
import type { Script } from '@/domain/Executables/Script/Script';

export class SelectedScriptStub implements SelectedScript {
  public readonly script: Script;

  public revert: boolean;

  public key: ExecutableKey;

  constructor(
    script: Script,
  ) {
    this.key = script.key;
    this.script = script;
  }

  public withRevert(revert: boolean): this {
    this.revert = revert;
    return this;
  }

  public equals(other: SelectedScript): boolean {
    return this.key.equals(other.key);
  }
}
