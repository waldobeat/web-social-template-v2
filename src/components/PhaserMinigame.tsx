import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface PhaserMinigameProps {
  tieBreakerScores: Record<string, number>;
  winners: string[];
}

export default function PhaserMinigame({ tieBreakerScores, winners }: PhaserMinigameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: gameRef.current,
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game;

    // References to the fill graphics for each player
    const fills: Record<string, Phaser.GameObjects.Graphics> = {};
    const texts: Record<string, Phaser.GameObjects.Text> = {};
    
    // Store scores in the scene for access in update
    game.scene.scenes[0]?.registry.set('scores', tieBreakerScores);

    function preload(this: Phaser.Scene) {
      // Preload assets if needed
    }

    function create(this: Phaser.Scene) {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      const title = this.add.text(width / 2, height * 0.1, '¡GUERRA DE TAP TAP!', {
        fontSize: '32px',
        color: '#39FF14', // neon green
        fontStyle: 'bold',
      }).setOrigin(0.5);

      this.tweens.add({
        targets: title,
        scaleX: 1.1,
        scaleY: 1.1,
        yoyo: true,
        repeat: -1,
        duration: 500,
      });

      const numPlayers = winners.length;
      const spacing = width / (numPlayers + 1);

      winners.forEach((player, index) => {
        const x = spacing * (index + 1);
        const y = height * 0.6;
        
        // Draw Glass Outline
        const glassWidth = 60;
        const glassHeight = 200;
        
        const outline = this.add.graphics();
        outline.lineStyle(4, 0xffffff, 1);
        outline.strokeRect(x - glassWidth/2, y - glassHeight/2, glassWidth, glassHeight);

        // Draw Fill
        const fill = this.add.graphics();
        fills[player] = fill;

        // Player Name
        texts[player] = this.add.text(x, y + glassHeight/2 + 20, player, {
          fontSize: '18px',
          color: '#ffffff',
        }).setOrigin(0.5);
      });
    }

    function update(this: Phaser.Scene) {
      const currentScores = this.registry.get('scores') as Record<string, number>;
      if (!currentScores) return;

      const glassWidth = 60;
      const glassHeight = 200;
      const maxScore = 20;

      winners.forEach((player, index) => {
        const score = currentScores[player] || 0;
        const fill = fills[player];
        if (fill) {
          fill.clear();
          const fillPercentage = Math.min(score / maxScore, 1);
          const currentFillHeight = glassHeight * fillPercentage;
          
          fill.fillStyle(0x39FF14, 0.8);
          
          const x = (this.cameras.main.width / (winners.length + 1)) * (index + 1);
          const y = this.cameras.main.height * 0.6;
          
          fill.fillRect(
            x - glassWidth/2 + 2, 
            y + glassHeight/2 - currentFillHeight - 2, 
            glassWidth - 4, 
            currentFillHeight
          );
        }
      });
    }

    // Handle resize
    const resize = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      game.destroy(true);
    };
  }, [winners]);

  useEffect(() => {
    // Update registry when scores change
    if (phaserGameRef.current) {
      const scene = phaserGameRef.current.scene.scenes[0];
      if (scene) {
        scene.registry.set('scores', tieBreakerScores);
      }
    }
  }, [tieBreakerScores]);

  return (
    <div 
      ref={gameRef} 
      className="absolute inset-0 z-50 overflow-hidden pointer-events-none" 
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
    />
  );
}
