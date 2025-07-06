import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

type FoodItem = {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

const foodDatabase: Record<string, FoodItem> = {
  'Chicken Breast (100g)': { protein: 31, carbs: 0, fat: 3.6, calories: 165 },
  'Brown Rice (100g)': { protein: 2.6, carbs: 23, fat: 0.9, calories: 111 },
  'Broccoli (100g)': { protein: 2.8, carbs: 7, fat: 0.4, calories: 34 },
  'Avocado (100g)': { protein: 2, carbs: 9, fat: 15, calories: 160 },
  'Egg (1 large)': { protein: 6, carbs: 0.6, fat: 5, calories: 78 },
};

export default function App() {
  const [userData, setUserData] = useState({
    weight: '',
    height: '',
    age: '',
    activity: '1.2',
  });
  const [calories, setCalories] = useState<number | null>(null);

  const [macroSplit, setMacroSplit] = useState({
    protein: '30',
    carbs: '40',
    fat: '30',
  });

  const [selectedFood, setSelectedFood] = useState('');
  const [foodLog, setFoodLog] = useState<string[]>([]);

  const calculateBMR = () => {
    const w = parseFloat(userData.weight);
    const h = parseFloat(userData.height);
    const a = parseFloat(userData.age);
    const act = parseFloat(userData.activity);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return;

    const bmr = 10 * w + 6.25 * h - 5 * a + 5;
    setCalories(Math.round(bmr * act));
  };

  const addFood = () => {
    if (selectedFood) {
      setFoodLog([...foodLog, selectedFood]);
      setSelectedFood('');
    }
  };

  const removeFood = (index: number) => {
    const updated = [...foodLog];
    updated.splice(index, 1);
    setFoodLog(updated);
  };

  const getTotals = () => {
    return foodLog.reduce(
      (acc, item) => {
        const food = foodDatabase[item];
        acc.protein += food.protein;
        acc.carbs += food.carbs;
        acc.fat += food.fat;
        acc.calories += food.calories;
        return acc;
      },
      { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );
  };

  const calculateTargets = () => {
    const p = parseFloat(macroSplit.protein);
    const c = parseFloat(macroSplit.carbs);
    const f = parseFloat(macroSplit.fat);
    if (p + c + f !== 100 || calories === null) return null;

    return {
      protein: Math.round((calories * (p / 100)) / 4),
      carbs: Math.round((calories * (c / 100)) / 4),
      fat: Math.round((calories * (f / 100)) / 9),
    };
  };

  const totals = getTotals();
  const targets = calculateTargets();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>🥗 Macro Tracker</Text>

        <Text style={styles.section}>👤 User Data</Text>
        {['weight', 'height', 'age'].map((field) => (
          <TextInput
            key={field}
            placeholder={`${field} (${field === 'age' ? 'years' : field === 'weight' ? 'kg' : 'cm'})`}
            keyboardType="numeric"
            style={styles.input}
            value={userData[field as keyof typeof userData]}
            onChangeText={(value) =>
              setUserData({ ...userData, [field]: value })
            }
          />
        ))}

        <Text>Activity Level</Text>
        <Picker
          selectedValue={userData.activity}
          onValueChange={(value) => setUserData({ ...userData, activity: value })}
          style={styles.input}
        >
          <Picker.Item label="Sedentary" value="1.2" />
          <Picker.Item label="Lightly Active" value="1.375" />
          <Picker.Item label="Moderately Active" value="1.55" />
          <Picker.Item label="Very Active" value="1.725" />
        </Picker>

        <Button title="Calculate Calories" onPress={calculateBMR} />
        {calories && <Text>Target Calories: {calories}</Text>}

        <Text style={styles.section}>⚖️ Macro % Split</Text>
        {['protein', 'carbs', 'fat'].map((macro) => (
          <TextInput
            key={macro}
            placeholder={`${macro} %`}
            keyboardType="numeric"
            style={styles.input}
            value={macroSplit[macro as keyof typeof macroSplit]}
            onChangeText={(val) =>
              setMacroSplit({ ...macroSplit, [macro]: val })
            }
          />
        ))}

        <Text style={styles.section}>🍽 Food</Text>
        <Picker
          selectedValue={selectedFood}
          onValueChange={(val) => setSelectedFood(val)}
          style={styles.input}
        >
          <Picker.Item label="-- Select Food --" value="" />
          {Object.keys(foodDatabase).map((item) => (
            <Picker.Item key={item} label={item} value={item} />
          ))}
        </Picker>
        <Button title="Add Food" onPress={addFood} />

        {foodLog.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <Text>
              ✅ {item} ({foodDatabase[item].calories} kcal)
            </Text>
            <Button title="Remove" onPress={() => removeFood(idx)} />
          </View>
        ))}

        <Text style={styles.section}>📊 Totals</Text>
        <Text>Calories: {totals.calories}</Text>
        <Text>Protein: {totals.protein}g</Text>
        <Text>Carbs: {totals.carbs}g</Text>
        <Text>Fat: {totals.fat}g</Text>

        {targets && (
          <>
            <Text style={styles.section}>🎯 Macro Targets</Text>
            <Text>Protein: {targets.protein}g</Text>
            <Text>Carbs: {targets.carbs}g</Text>
            <Text>Fat: {targets.fat}g</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  section: { fontSize: 18, marginTop: 20, fontWeight: 'bold' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
});
